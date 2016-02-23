/*global defineSuite*/
defineSuite([
        'Core/PolylineVolumeOutlineGeometry',
        'Core/Cartesian2',
        'Core/Cartesian3',
        'Core/CornerType',
        'Core/Ellipsoid',
        'Specs/createPackableSpecs'
    ], function(
        PolylineVolumeOutlineGeometry,
        Cartesian2,
        Cartesian3,
        CornerType,
        Ellipsoid,
        createPackableSpecs) {
    'use strict';

    var shape;

    beforeAll(function() {
        shape = [new Cartesian2(-10000, -10000), new Cartesian2(10000, -10000), new Cartesian2(10000, 10000), new Cartesian2(-10000, 10000)];
    });

    it('throws without polyline positions', function() {
        expect(function() {
            return new PolylineVolumeOutlineGeometry({});
        }).toThrowDeveloperError();
    });

    it('throws without shape positions', function() {
        expect(function() {
            return new PolylineVolumeOutlineGeometry({
                polylinePositions: [new Cartesian3()]
            });
        }).toThrowDeveloperError();
    });

    it('createGeometry returnes undefined without 2 unique polyline positions', function() {
        var geometry = PolylineVolumeOutlineGeometry.createGeometry(new PolylineVolumeOutlineGeometry({
            polylinePositions: [new Cartesian3()],
            shapePositions: shape
        }));
        expect(geometry).toBeUndefined();
    });

    it('createGeometry returnes undefined without 3 unique shape positions', function() {
        var geometry = PolylineVolumeOutlineGeometry.createGeometry(new PolylineVolumeOutlineGeometry({
            polylinePositions: [Cartesian3.UNIT_X, Cartesian3.UNIT_Y],
            shapePositions: [Cartesian2.UNIT_X, Cartesian2.UNIT_X, Cartesian2.UNIT_X]
        }));
        expect(geometry).toBeUndefined();
    });

    it('computes positions', function() {
        var m = PolylineVolumeOutlineGeometry.createGeometry(new PolylineVolumeOutlineGeometry({
            polylinePositions : Cartesian3.fromDegreesArray([
                90.0, -30.0,
                90.0, -35.0
            ]),
            shapePositions: shape,
            cornerType: CornerType.MITERED
        }));

        var numVertices = 24; // 6 polyline positions * 4 box positions
        var numLines = 28; // 4 lines connecting 5 positions + 4 lines on 2 end caps
        expect(m.attributes.position.values.length).toEqual(numVertices * 3);
        expect(m.indices.length).toEqual(numLines * 2);
    });

    it('computes positions, clockwise shape', function() {
        var m = PolylineVolumeOutlineGeometry.createGeometry(new PolylineVolumeOutlineGeometry({
            polylinePositions : Cartesian3.fromDegreesArray([
                90.0, -30.0,
                90.0, -35.0
            ]),
            shapePositions: shape.reverse(),
            cornerType: CornerType.MITERED
        }));

        var numVertices = 24; // 6 polyline positions * 4 box positions
        var numLines = 28; // 4 lines connecting 5 positions + 4 lines on 2 end caps
        expect(m.attributes.position.values.length).toEqual(numVertices * 3);
        expect(m.indices.length).toEqual(numLines * 2);
    });

    it('computes right turn', function() {
        var m = PolylineVolumeOutlineGeometry.createGeometry(new PolylineVolumeOutlineGeometry({
            polylinePositions : Cartesian3.fromDegreesArray([
                90.0, -30.0,
                90.0, -31.0,
                91.0, -31.0
            ]),
            cornerType: CornerType.MITERED,
            shapePositions: shape
        }));

        var numVertices = 20; // 5 polyline positions (2 ends + 3 for the corner) * 4 box positions
        var numLines = 24; // 4 lines connecting 4 positions + 4 lines on 2 end caps
        expect(m.attributes.position.values.length).toEqual(numVertices * 3);
        expect(m.indices.length).toEqual(numLines * 2);
    });

    it('computes left turn', function() {
        var m = PolylineVolumeOutlineGeometry.createGeometry(new PolylineVolumeOutlineGeometry({
            polylinePositions : Cartesian3.fromDegreesArray([
                90.0, -30.0,
                90.0, -31.0,
                89.0, -31.0
            ]),
            cornerType: CornerType.MITERED,
            shapePositions: shape
        }));

        var numVertices = 20; // 5 polyline positions (2 ends + 3 for the corner) * 4 box positions
        var numLines = 24; // 4 lines connecting 4 positions + 4 lines on 2 end caps
        expect(m.attributes.position.values.length).toEqual(numVertices * 3);
        expect(m.indices.length).toEqual(numLines * 2);
    });

    it('computes with rounded corners', function() {
        var m = PolylineVolumeOutlineGeometry.createGeometry(new PolylineVolumeOutlineGeometry({
            polylinePositions : Cartesian3.fromDegreesArray([
                90.0, -30.0,
                90.0, -31.0,
                89.0, -31.0,
                89.0, -32.0
            ]),
            cornerType: CornerType.ROUNDED,
            shapePositions: shape
        }));

        var corners = 90 / 5 * 2 * 4;
        var numVertices = corners + 28; // corners + 7 segments
        var numLines = corners + 32; // corners + 6 segments + 2 end caps
        expect(m.attributes.position.values.length).toEqual(numVertices * 3);
        expect(m.indices.length).toEqual(numLines * 2);
    });

    it('computes with beveled corners', function() {
        var m = PolylineVolumeOutlineGeometry.createGeometry(new PolylineVolumeOutlineGeometry({
            polylinePositions : Cartesian3.fromDegreesArray([
                 90.0, -30.0,
                 90.0, -31.0,
                 89.0, -31.0,
                 89.0, -32.0
            ]),
            cornerType: CornerType.BEVELED,
            shapePositions: shape
        }));

        var numVertices = 40; // 10 positions * shape
        var numLines = 44; // 10 segments + 8 edge lines
        expect(m.attributes.position.values.length).toEqual(numVertices * 3);
        expect(m.indices.length).toEqual(numLines * 2);
    });

    var positions = [new Cartesian3(1.0, 0.0, 0.0), new Cartesian3(0.0, 1.0, 0.0), new Cartesian3(0.0, 0.0, 1.0)];
    var volumeShape = [new Cartesian2(0.0, 0.0), new Cartesian2(1.0, 0.0), new Cartesian2(0.0, 1.0)];
    var volume = new PolylineVolumeOutlineGeometry({
        polylinePositions : positions,
        cornerType: CornerType.BEVELED,
        shapePositions: volumeShape,
        ellipsoid : Ellipsoid.UNIT_SPHERE,
        granularity : 0.1
    });
    var packedInstance = [3.0, 1.0, 0.0, 0.0, 0.0, 1.0, 0.0, 0.0, 0.0, 1.0, 3.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 1.0, 1.0, 2.0, 0.1];
    createPackableSpecs(PolylineVolumeOutlineGeometry, volume, packedInstance);
});
